import React, { PropTypes } from 'react';
import { View, StyleSheet, TouchableHighlight, Image, Platform } from 'react-native';
import {Text, Icon} from 'react-native-elements';
import fonts from './font';
import normalize from './normalize';

const colors = {
    primary: '#9E9E9E',
    primary1: '#4d86f7',
    primary2: '#6296f9',
    secondary: '#8F0CE8',
    secondary2: '#00B233',
    secondary3: '#00FF48',
    grey0: '#393e42',
    grey1: '#43484d',
    grey2: '#5e6977',
    grey3: '#86939e',
    grey4: '#bdc6cf',
    grey5: '#e1e8ee',
    dkGreyBg: '#232323',
    greyOutline: '#cbd2d9',
    searchBg: '#303337',
    disabled: '#dadee0',
    white: '#ffffff',
    error: '#ff190c'
};


const ListItem = ({
    onPress,
    title,
    leftIcon,
    rightIcon,
    avatar,
    avatarStyle,
    underlayColor,
    subtitle,
    subtitleStyle,
    containerStyle,
    wrapperStyle,
    titleStyle,
    titleContainerStyle,
    hideChevron,
    chevronColor,
    roundAvatar,
    component,
    fontFamily,
    rightTitle,
    rightTitleContainerStyle,
    rightTitleStyle,
    subtitleContainerStyle,
    label,
    onLongPress,
}) => {
    let Component = onPress || onLongPress ? TouchableHighlight : View
    if (component) {
        Component = component
    }
    if (typeof avatar === 'string') {
        avatar = {uri: avatar}
    }
    return (
        <Component
            onLongPress={onLongPress}
            onPress={onPress}
            underlayColor={underlayColor}
            style={[styles.container, containerStyle && containerStyle]}>
            <View style={[styles.wrapper, wrapperStyle && wrapperStyle]}>
                {
                    leftIcon && leftIcon.name && (
                        <Icon
                            type={leftIcon.type}
                            iconStyle={[styles.icon, leftIcon.style && leftIcon.style]}
                            name={leftIcon.name}
                            color={leftIcon.color || colors.grey4}
                            size={leftIcon.size || 24}
                        />
                    )
                }
                {
                    avatar && (
                        <Image
                            style={[
                styles.avatar,
                roundAvatar && {borderRadius: 17},
                avatarStyle && avatarStyle]}
                            source={avatar}
                        />
                    )
                }
                <View style={styles.titleSubtitleContainer}>
                    <View style={titleContainerStyle}>
                        {(title && (typeof title === 'string')) ? (
                                <Text
                                    style={[
                  styles.title,
                  !leftIcon && {marginLeft: 10},
                  titleStyle && titleStyle,
                  fontFamily && {fontFamily}
                ]}>{title}</Text>
                            ) : (
                                <View>
                                    {title}
                                </View>
                            )}
                    </View>
                    <View style={subtitleContainerStyle}>
                        {(subtitle && (typeof subtitle === 'string')) ? (
                                <Text
                                    style={[
                  styles.subtitle,
                  !leftIcon && {marginLeft: 10},
                  subtitleStyle && subtitleStyle,
                  fontFamily && {fontFamily}
                ]}>{subtitle}</Text>
                            ) : (
                                <View>
                                    {subtitle}
                                </View>
                            )}
                    </View>
                </View>
                {
                    rightTitle && (rightTitle !== '') && (
                        <View style={[styles.rightTitleContainer, rightTitleContainerStyle]}>
                            <Text style={[styles.rightTitleStyle, rightTitleStyle]}>{rightTitle}</Text>
                        </View>
                    )
                }
                {
                    !hideChevron && (
                        <View style={styles.chevronContainer}>
                            <Icon
                                type={rightIcon.type}
                                iconStyle={[ styles.chevron, rightIcon.style ]}
                                size={28}
                                name={rightIcon.name || 'chevron-right'}
                                color={rightIcon.color || chevronColor}
                                onPress={rightIcon.onPress}
                            />
                        </View>
                    )
                }

                {
                    label && label
                }
            </View>
        </Component>
    )
}

ListItem.defaultProps = {
    underlayColor: 'white',
    chevronColor: colors.grey4,
    rightIcon: {name: 'chevron-right'},
    hideChevron: false,
    roundAvatar: false
}

ListItem.propTypes = {
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    avatar: PropTypes.any,
    icon: PropTypes.any,
    onPress: PropTypes.func,
    rightIcon: PropTypes.object,
    underlayColor: PropTypes.string,
    subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    subtitleStyle: PropTypes.any,
    containerStyle: PropTypes.any,
    wrapperStyle: PropTypes.any,
    titleStyle: PropTypes.any,
    titleContainerStyle: PropTypes.any,
    hideChevron: PropTypes.bool,
    chevronColor: PropTypes.string,
    roundAvatar: PropTypes.bool,
}

styles = StyleSheet.create({
    avatar: {
        width: 34,
        height: 34
    },
    container: {
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        borderBottomColor: '#ededed',
        borderBottomWidth: 1,
        backgroundColor: 'transparent'
    },
    wrapper: {
        flexDirection: 'row',
        marginLeft: 10,
    },
    icon: {
        marginRight: 8
    },
    title: {
        fontSize: normalize(14),
        color: colors.grey1
    },
    subtitle: {
        color: colors.grey3,
        fontSize: normalize(12),
        marginTop: 1,
        ...Platform.select({
            ios: {
                fontWeight: '600'
            },
            android: {
                fontFamily: fonts.android.bold
            }
        })
    },
    titleSubtitleContainer: {
        justifyContent: 'center',
        flex: 1,
    },
    chevronContainer: {
        flex: 0.15,
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
    rightTitleContainer: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
    rightTitleStyle: {
        marginRight: 5,
        color: colors.grey4
    },
    chevron: {
    }
})

export default ListItem
